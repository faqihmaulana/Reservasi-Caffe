import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema=z.object({userId:z.string().min(1),seatId:z.string().min(1),date:z.string(),startTime:z.string(),endTime:z.string(),guests:z.number().int().positive(),notes:z.string().optional()});
export async function POST(req:Request){
 try{const data=schema.parse(await req.json());const date=new Date(`${data.date}T00:00:00`);
  const conflict=await prisma.reservation.findFirst({where:{seatId:data.seatId,date,status:{in:['PENDING','CONFIRMED']},AND:[{startTime:{lt:data.endTime}},{endTime:{gt:data.startTime}}]}});
  if(conflict)return NextResponse.json({error:'Seat is already reserved for this time.'},{status:409});
  const code=`AURA-${Date.now().toString(36).toUpperCase()}`;
  const reservation=await prisma.reservation.create({data:{...data,date,code,fee:25000}});
  return NextResponse.json({reservation},{status:201});
 }catch(e){return NextResponse.json({error:'Invalid reservation data.'},{status:400})}
}
