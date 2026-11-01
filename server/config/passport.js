/**
 * PASSPORT CONFIGURATION
 * Configuration pour l'authentification JWT et Google OAuth 2.0
 * Compatible à 100% avec MongoDB et le mode autonome dbStore
 */

const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');
const dbStore = require('../services/dbStore');

// Extracteur double : Header Authorization Bearer OU Cookie
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.accessToken || req.cookies.token || req.cookies.jwt;
  }
  return token;
};

// ============================================================
// JWT STRATEGY
// ============================================================
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    cookieExtractor,
  ]),
  secretOrKey: process.env.JWT_SECRET || 'cryptoconnect_jwt_secret_dev_2026',
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      let user = null;

      if (mongoose.connection.readyState === 1) {
        user = await User.findById(payload.id).select('-password');
      } else {
        user = dbStore.findUserById(payload.id);
      }

      if (!user) {
        return done(null, false);
      }

      if (user.accountStatus && user.accountStatus !== 'active') {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

// ============================================================
// GOOGLE OAUTH 2.0 STRATEGY
// ============================================================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = null;

          if (mongoose.connection.readyState === 1) {
            user = await User.findOne({ googleId: profile.id });
            if (!user) {
              user = await User.findOne({ email: profile.emails[0].value });
              if (user) {
                user.googleId = profile.id;
                user.avatarUrl = profile.photos[0]?.value;
                await user.save();
              } else {
                user = await User.create({
                  googleId: profile.id,
                  email: profile.emails[0].value,
                  name: profile.displayName,
                  avatarUrl: profile.photos[0]?.value,
                  emailVerified: true,
                  accountStatus: 'active',
                  authProvider: 'google',
                });
              }
            }
          } else {
            user = dbStore.findUser((u) => u.googleId === profile.id);
            if (!user) {
              user = dbStore.findUserByEmail(profile.emails[0].value);
              if (user) {
                user = dbStore.updateUser(user._id, {
                  googleId: profile.id,
                  avatarUrl: profile.photos[0]?.value,
                });
              } else {
                user = await dbStore.createUser({
                  googleId: profile.id,
                  email: profile.emails[0].value,
                  name: profile.displayName,
                  avatarUrl: profile.photos[0]?.value,
                  emailVerified: true,
                  authProvider: 'google',
                });
              }
            }
          }

          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
} else {
  console.log('ℹ️ Google OAuth en attente d\'identifiants (authentification locale & démo opérationnelles)');
}

module.exports = passport;
