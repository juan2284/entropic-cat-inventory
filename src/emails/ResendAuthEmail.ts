import { Resend } from "resend";
import dotenv from 'dotenv';

dotenv.config();
interface IEmail {
  email: string;
  name: string;
  token: string;
};

const resend = new Resend(process.env.API_KEY);

export class AuthEmailResend {
  static sendConfirmationEmail = async (user: IEmail) => {
    const { data, error } = await resend.emails.send({
      from: 'EntropicCat <admin@entropiccat.com>',
      to: [`${user.email}`],
      subject: 'EntropicCat - Confirma el Usuario',
      text: 'EntropicCat - Confirma el Usuario',
      html: `
        <p>Hola: ${user.name}, has creado el usuario en la app de Inventario de EntropicCat, ya casi esta todo listo, solo debes confirmar tu cuenta</p>
        <p>Visita el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/auth/confirmar-usuario">Confirmar usuario</a>
        <p>E ingresa el código: <b>${user.token}</b></p>
        <p>Este token expira en 10 minutos</p>
      `,
    });
    console.log('Mensaje enviado', data.id);

    if (error) {
      return console.error({ error });
    }
  };

  static sendPasswordResetToken = async (user: IEmail) => {
    const { data, error } = await resend.emails.send({
      from: 'EntropicCat <admin@entropiccat.com>',
      to: [`${user.email}`],
      subject: 'EntropicCat - Reestablece tu password',
      text: 'EntropicCat - Reestablece tu password',
      html: `
        <p>Hola: ${user.name}, has solicitado reestablecer tu password.</p>
        <p>Visita el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/auth/nuevo-password">Reestablecer Password</a>
        <p>E ingresa el código: <b>${user.token}</b></p>
        <p>Este token expira en 10 minutos</p>
      `,
    });
    console.log('Mensaje enviado', data.id);

    if (error) {
      return console.error({ error });
    }
  };


}