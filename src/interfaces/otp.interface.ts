export interface OTP {
  pk: number;
  uuid: string;
  
  user_id: number;

  key: string;
  type: string;
  status: string;

  expired_at?: Date;
}

export interface createOTP {
  user_id: number;
}