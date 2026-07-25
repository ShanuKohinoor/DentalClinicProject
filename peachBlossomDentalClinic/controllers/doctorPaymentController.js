import { myPayment } from "../models/doctorPayment.js";
import { myDentist } from "../models/doctors.js";
import { BadRequestError } from "../utils/error.js";

// Render Add/Update Payment Form
export const getAddPaymentForm = async (req, res, next) => {
    try {
        const dentist = await myDentist.findById(req.params.id);
        if (!dentist) throw new BadRequestError('Doctor not found');

        const payments = await myPayment.find({ doctor: dentist._id }).sort({ createdAt: -1 });

        res.render('pages/addPayment', {
            title: 'Manage Payment',
            dentist,
            payments
        });

    } catch (error) {
        next(error);
    }
};

// Save/Update Payment
export const postAddPaymentForm = async (req, res, next) => {
    try {
        const dentist = await myDentist.findById(req.params.id);
        if (!dentist) throw new BadRequestError('Doctor not found');

        console.log("Doctor salary used:", dentist.salary);

        const { month, paidAmount } = req.body;

        if (!month) {
            throw new BadRequestError("Month is required");
        }

        const paidAmountNumber = Number(paidAmount || 0);
        const totalSalaryNumber = Number(dentist.salary || 0);

        let paymentStatus;

        if (paidAmountNumber >= totalSalaryNumber) {
            paymentStatus = 'Paid';
        } else if (paidAmountNumber > 0) {
            paymentStatus = 'Partial';
        } else {
            paymentStatus = 'Pending';
        }

        const paymentDate = paidAmountNumber > 0 ? new Date() : null;

        await myPayment.findOneAndUpdate(
            { doctor: dentist._id, month },
            {
                $set: {
                    totalSalary: totalSalaryNumber,
                    paidAmount: paidAmountNumber,
                    paymentStatus,
                    paymentDate
                }
            },
            {
                upsert: true,
                new: true
            }
        );

        res.redirect(`/admin/doctor/${dentist._id}/paymentsHistory`);

    } catch (error) {
        next(error);
    }
};