import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

const COOKIE='aura_session';
const DAYS=7;
const hash=(v:string)=>createHash('sha256').update(v).digest('hex');

export async function createSession(userId:string){
  const token=randomBytes(32).toString('hex');
  await prisma.session.create({data:{tokenHash:hash(token),userId,expiresAt:new Date(Date.now()+DAYS*86400000)}});
  (await cookies()).set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:DAYS*86400});
}
export async function getCurrentUser(){
  const token=(await cookies()).get(COOKIE)?.value;
  if(!token)return null;
  const session=await prisma.session.findUnique({where:{tokenHash:hash(token)},include:{user:true}});
  if(!session || session.expiresAt<new Date()) return null;
  return session.user;
}
export async function requireAdmin(){
  const user=await getCurrentUser();
  if(!user || user.role!=='ADMIN') return null;
  return user;
}
export async function destroySession(){
  const token=(await cookies()).get(COOKIE)?.value;
  if(token) await prisma.session.deleteMany({where:{tokenHash:hash(token)}});
  (await cookies()).delete(COOKIE);
}
