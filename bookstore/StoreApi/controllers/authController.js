const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const crypto = require("crypto");
const sendEmail = require("./../utils/email");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  },
  store: MongoStore.create({ mongoUrl: process.env.DATABASE })
};

const AppError = require('../utils/appError'); 

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, passwordChangedAt, role } = req.body;

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
    role: role || 'user' 
  });

  const token = signToken(newUser.id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});


exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  if (req.session) {
    req.session.userId = user._id;
  } else {
    return next(new AppError("Session not initialized", 500));
  }

  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user._id,
        role: user.role
      }
    },
  });
});


exports.logout = (req, res, next) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.error('Logout error:', err);
        return next(new AppError("Error while logging out. Try again later!", 500));
      }
      res.clearCookie('connect.sid');
      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully!',
      });
    });
  } else {
    console.error('Session not initialized');
    return next(new AppError("Session not initialized", 500));
  }
};


exports.protect = catchAsync(async (req, res, next) => {
  const { userId } = req.session;

  if (!userId) {
    return next(new AppError("You are not logged in! Please log in to get access", 401));
  }

  const currentUser = await User.findById(userId);
  if (!currentUser) {
    return next(new AppError("The user no longer exists.", 401));
  }

  if (currentUser.changedPasswordAfter(req.session.cookie.expires)) {
    return next(new AppError("User recently changed password! Please log in again.", 401));
  }

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with that email address.", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("There was an error sending the email. Try again later!", 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  req.session.userId = user._id;
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  req.session.userId = user._id;
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
