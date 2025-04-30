export declare class CreateDeviceDataDto {
    patient: string;
    deviceId: string;
    deviceType: string;
    timestamp: Date;
    data: Record<string, any>;
    isAbnormal?: boolean;
    abnormalityReason?: string;
    notificationSent?: boolean;
}
