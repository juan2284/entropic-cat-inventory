import { Router } from "express";
import { body, param } from "express-validator";
import reminderExists from "../middlewares/reminderExist.js";
import { handleInputErrors } from "../middlewares/validation.js";
import { ReminderController } from "../controllers/ReminderController.js";

const router = Router();
router.param('reminderId', reminderExists);

router.get('/', ReminderController.getReminders);

router.get('/:reminderId',
  param('reminderId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  ReminderController.getReminderById
);

router.post('/add-reminder',
  body('service').notEmpty().withMessage('Service is required').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  ReminderController.addNewReminder
);

router.patch('/edit-reminder/:reminderId',
  param('reminderId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  ReminderController.editReminder
);

router.delete('/delete-reminder/:reminderId',
  param('reminderId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  ReminderController.deleteReminder
);


export default router;