import { Notification } from '../models/Notification.js';
import * as emailService from './emailService.js';

export const createNotification = async ({
  recipientId,
  title,
  message,
  type = 'general',
  complaintId = null,
}) => {
  try {
    return await Notification.create({
      recipient: recipientId,
      title,
      message,
      type,
      complaint: complaintId,
    });
  } catch (error) {
    console.error('[Notification Service Error]', error.message);
    throw error;
  }
};

export { emailService };
