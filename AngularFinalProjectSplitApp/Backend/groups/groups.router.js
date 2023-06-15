import { Router } from 'express'
import multer from 'multer'
import { add_group, add_member, add_transaction, get_groups, get_members, get_transaction_by_id, get_transactions, update_member_pending_status_by_id, checkPendingStatus } from './groups.controller.js';
import { checkToken } from '../users/users.middleware.js';

const router = Router();

router.post('/', add_group);
router.get('/', get_groups); // (both user in, and pending groups with ?pending=true)

router.post('/:group_id/members', add_member);
router.get('/:group_id/members/', get_members);
router.get('/pending/:userId', checkPendingStatus); // to know the status is pending or not(added by saroj)
router.get('/:group_id/members/:member_id', update_member_pending_status_by_id);

router.post('/:group_id/transactions', multer({ dest: 'uploads/' }).single('receipt'), checkToken, add_transaction);
router.get('/:group_id/transactions', get_transactions);
router.get('/:group_id/transactions/:transaction_id', get_transaction_by_id);

export default router;



