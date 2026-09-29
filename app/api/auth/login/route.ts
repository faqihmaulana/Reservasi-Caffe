import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';

const schema=z.object({email:z.string().email(),password:z.string().min(8)});
export async function POST(req:Request){
 try{
  const {email,password}=schema.parse(await req.json());
  const user=await prisma.user.findUnique({where:{email:email.toLowerCase()}});
  if(!user || user.role!=='ADMIN' || !(await bcrypt.compare(password,user.passwordHash))) return NextResponse.json({error:'Email atau password salah.'},{status:401});
  await createSession(user.id);
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:'Data login tidak valid.'},{status:400})}
}
