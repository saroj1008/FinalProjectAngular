import { Types } from 'mongoose';
import { Mongoose } from 'mongoose';
import { ErrorResponse } from "../error.js";
import usersModel from "../users/users.model.js";
import groupsModel from "./groups.model.js";

export const add_group = async (req, res, next) => {
    try {
        const { tokenData } = req.body;
        const new_group = req.body;
        console.log("test_newgroup", new_group);
        const results = await groupsModel.create({
            ...new_group,
            members: [{
                user_id: tokenData._id,
                fullname: tokenData.fullname,
                email: tokenData.email,
                pending: false
            }]
        })
        res.json({ success: true, data: results })
    } catch (error) {
        next(error)
    }
}
export const get_groups = async (req, res, next) => {
    try {
        const { tokenData } = req.body;
        const pending = req.query?.pending ? true : false;

        const results = await groupsModel.find({ members: { $elemMatch: { 'user_id': tokenData._id, pending } } }, { transactions: 0, members: 0 }).lean();
        res.json({ success: true, data: results })

    } catch (error) {
        next(error)
    }
}
export const update_member_pending_status_by_id = async (req, res, next) => {
    try {
        const { group_id, member_id } = req.params;
        const { tokenData } = req.body;
        console.log("hit-2 groupId, memberID, tokenId", group_id, member_id, tokenData._id);
        if (member_id !== tokenData._id) throw new ErrorResponse('User must change the status of their own account', 404);

        const results = await groupsModel.updateOne(
            { _id: group_id, members: { $elemMatch: { 'user_id': member_id, pending: true } } },
            { $set: { 'members.$.pending': false } })
        res.json({ success: true, data: results.modifiedCount ? true : false })
    } catch (error) {
        next(error)
    }
}
export const add_member = async (req, res, next) => {
    try {
        const { group_id } = req.params;
        const { tokenData } = req.body;
        const member_to_add = await usersModel.findOne({ 'email': req.body.email }).lean();
        if (!member_to_add) throw new ErrorResponse('User not found', 404);

        const results = await groupsModel.updateOne(
            { _id: group_id, members: { $elemMatch: { 'user_id': tokenData._id, pending: false } } },
            {
                $addToSet: {
                    members: {
                        user_id: member_to_add._id,
                        fullname: member_to_add.fullname,
                        email: member_to_add.email,
                        pending: true
                    }
                }
            })
        res.json({ success: true, data: results.modifiedCount ? true : false })
    } catch (error) {
        next(error)
    }
}
export const get_members = async (req, res, next) => {
    try {
        const { tokenData } = req.body;
        const { group_id } = req.params;

        const results = await groupsModel.findOne({ _id: group_id, members: { $elemMatch: { 'user_id': tokenData._id, pending: false } } }, { transactions: 0 }).lean();
        results && res.json({ success: true, data: results.members })

    } catch (error) {
        next(error)
    }
}

export const add_transaction = async (req, res, next) => {
    try {
        const { group_id } = req.params;
        const { title, description, category, amount, date, tokenData: { _id: user_id, fullname } } = req.body;
        const { originalname, filename } = req.file;
        const results = await groupsModel.updateOne(
            { _id: group_id, members: { $elemMatch: { 'user_id': user_id, pending: false } } },
            {
                $push: {
                    transactions: {
                        title,
                        description,
                        paid_by: { user_id, fullname },
                        category,
                        amount,
                        date,
                        receipt: { filename, originalname }
                    }
                }
            }
        )
        res.json({ success: true, data: results.modifiedCount ? true : false })
    } catch (error) {
        next(error)
    }
}
export const get_transactions = async (req, res, next) => {
    try {
        const { group_id } = req.params;
        const { tokenData } = req.body;
        const results = await groupsModel.findOne({ _id: group_id, members: { $elemMatch: { 'user_id': tokenData._id, pending: false } } }, { transactions: 1 }).lean();
        results && res.json({ success: true, data: results.transactions })
    } catch (error) {
        next(error)
    }
}
export const get_transaction_by_id = async (req, res, next) => {
    try {
        const { group_id, transaction_id } = req.params;
        const { tokenData } = req.body;
        const results = await groupsModel.aggregate([
            { $match: { _id: new Types.ObjectId(group_id) } },
            { $unwind: '$members' },
            { $match: { "members.user_id": new Types.ObjectId(tokenData._id) } },
            { $project: { transactions: '$transactions', _id: 0 } },
            { $unwind: '$transactions' },
            { $match: { "transactions._id": new Types.ObjectId(transaction_id) } },
        ])
        res.json({ success: true, data: results[0].transactions || false })
    } catch (error) {
        next(error)
    }
}

/* 
It will give the array of pending, memberId, groupname and groupid
[{
    "groupId": "648b24b74db4ee5d7142b53e",
    "groupName": "Chicken group",
    "memberId": "648b24c84db4ee5d7142b544",
    "pending": true
},..]
*/

export const checkPendingStatus = async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const groups = await groupsModel.aggregate([
        { $match: { 'members.user_id': new Types.ObjectId(userId), 'members.pending': true } },
        { $project: { _id: 1, title: 1, members: { $filter: { input: '$members', as: 'member', cond: { $eq: ['$$member.user_id', new Types.ObjectId(userId)] } } } } },
        { $unwind: '$members' },
        { $project: { group_id: '$_id', groupTitle: '$title', member_id: userId, pending: '$members.pending', _id: 0 } }
      ]);
  
      if (groups.length === 0) {
        return res.status(200).json({ message: 'No groups with pending status found.' });
      }
  
      return res.status(200).json({ groups });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred while fetching groups.' });
    }
  };
  