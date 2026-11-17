export type Role = 'ADMIN' | 'STUDENT' | 'TEACHER'

export interface AppUser {
  id: string
  name: string
  email: string
  role: Role
  subject?: string | null
  phone?: string | null
  officeHours?: string | null
  bio?: string | null
  avatarUrl?: string | null
}

export interface Scholarship {
  id: string
  title: string
  provider: string
  country: string
  degreeLevel: string
  fundingType: string
  deadline: string
  applicationUrl: string
  description: string
  createdAt: string
  userStatus?: TrackingStatus | null
}

export type TrackingStatus = 'INTERESTED' | 'SAVED' | 'APPLIED'

export interface Teacher {
  id: string
  name: string
  email: string
  subject?: string | null
  phone?: string | null
  officeHours?: string | null
  bio?: string | null
  avatarUrl?: string | null
}

export interface AppMessage {
  id: string
  fromUserId: string
  toUserId: string
  subject: string
  content: string
  messageType: 'QUERY' | 'RECOMMENDATION_REQUEST'
  status: 'SENT' | 'READ'
  createdAt: string
  fromUser: { id: string; name: string; email: string; role: Role }
  toUser: { id: string; name: string; email: string; role: Role; subject?: string | null }
}

export type ViewKey = 'scholarships' | 'scholarship-detail' | 'admin' | 'teachers' | 'messages'
