// types/models.ts

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEACHER";
  createdAt?: string;
}

export interface ITeacher {
  id: string;
  userId: string;
  user?: IUser;
  classes?: IClass[];
}

export interface IStudent {
  id: string;
  name: string;
  parentContact: string;
  classId?: string;
  className?: string;
}

export interface IClass {
  id: string;
  name: string;
  teacherId?: string;
  teacherName?: string;
  studentCount?: number;
}

export interface IMessage {
  id: string;
  senderId: string;
  message: string;
  type: "SMS" | "EMAIL" | "WHATSAPP";
  targets: string[]; // class ids, student ids, or ['all']
  createdAt?: string;
}

export interface IMessageTemplate {
  id: string;
  name: string;
  content: string;
  createdAt?: string;
}

export interface IAttendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  present: boolean;
}
