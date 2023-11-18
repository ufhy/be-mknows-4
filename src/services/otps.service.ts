import { Service } from "typedi";
import { Transaction } from "sequelize";
import { DB } from "@database";

import { OTP } from "@interfaces/otp.interface";
import { HttpException } from "@exceptions/HttpException";

@Service()
export class OTPService {
  public async createOTP(data, validInMinutes: number, transaction: Transaction): Promise<OTP> {
    // untuk generate otp || validInMinutes = mau valid berapa menit si otpnya
    const key = Math.floor(Math.pow(10, 8 - 1) + Math.random() * 9 * Math.pow(10, 8 - 1)).toString();
    const currentDateTime = new Date();
    const expirationTime = new Date(currentDateTime.getTime() + validInMinutes * 60000);
  
    const otp = await DB.OTPs.create({
      user_id: data.user_id,
      key,
      type: data.type,
      status: "AVAILABLE",
      expired_at: expirationTime,
    }, { transaction });

    return otp;
  }

  public async findOTP(data: { user_id: number, key: string, type: string }): Promise<boolean> {
    const otp = await DB.OTPs.findOne({
      where: {
        user_id: data.user_id,
        key: data.key,
        status: "AVAILABLE",
      }
    });

    if(!otp) {
      throw new HttpException(false, 400, "OTP is not valid");
    }

    if(new Date(otp.expired_at) < new Date()) {
      otp.status = "EXPIRED";
      await otp.save();

      throw new HttpException(false, 400, "OTP is not valid");
    }

    otp.status = "USED";
    await otp.save();

    return true;
  }
}