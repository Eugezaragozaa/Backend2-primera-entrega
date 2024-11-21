import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { User } from '../models/user.js';

// Estrategia de registro
passport.use(
    'register',
    new LocalStrategy(
    { usernameField: 'email', passwordField: 'password', passReqToCallback: true },
    async (req, email, password, done) => {
        try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return done(null, false, { message: 'El email ya está registrado' });
        }
        const newUser = new User(req.body);
        await newUser.save();
        return done(null, newUser);
        } catch (error) {
        return done(error);
        }
    }
    )
);

// Estrategia de login
passport.use(
    'login',
    new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
        try {
        const user = await User.findOne({ email });
        if (!user || !user.comparePassword(password)) {
            return done(null, false, { message: 'Credenciales incorrectas' });
        }
        return done(null, user);
        } catch (error) {
        return done(error);
        }
    }
    )
);  // Aquí faltaba el cierre del paréntesis de la estrategia 'login'

// Estrategia JWT
passport.use(
    new JWTStrategy(
    {
        jwtFromRequest: ExtractJwt.fromExtractors([(req) => req.cookies.jwt]),
      secretOrKey: 'secretJWT' // Cambiar a una clave más segura en producción
    },
    async (jwtPayload, done) => {
        try {
        const user = await User.findById(jwtPayload.id);
        if (!user) return done(null, false, { message: 'Token inválido' });
        return done(null, user);
        } catch (error) {
        return done(error);
        }
    }
    )
);

export default passport;