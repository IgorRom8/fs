import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { Brand } from "@/src/shared/ui/brand";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await auth()) redirect("/admin");
  const { error } = await searchParams;
  return <main className="admin-login"><div className="admin-login-card"><div className="admin-login-brand"><Brand /></div><span>ПАНЕЛЬ УПРАВЛЕНИЯ</span><h1>Добро пожаловать</h1><p>Введите данные администратора для продолжения.</p><form action={async(formData)=>{"use server";try{await signIn("credentials",{username:formData.get("username"),password:formData.get("password"),redirectTo:"/admin"})}catch(authError){if(authError instanceof AuthError)redirect("/admin/login?error=invalid");throw authError}}}><label>Логин<input name="username" type="text" autoComplete="username" required autoFocus/></label><label>Пароль<input name="password" type="password" autoComplete="current-password" required/></label>{error&&<p className="admin-login-error" role="alert">Неверный логин или пароль. После пяти попыток вход временно блокируется.</p>}<button type="submit">Войти в панель</button></form><small>Защищённый доступ администратора</small></div></main>;
}
