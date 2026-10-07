export const validateNoReasonAndDestiny = (req, res, next) => {

    const { reason, destiny } = req.body;

    if (reason || destiny) {
        return res.status(400).json({
            success: false,
            msg: 'You cannot send this data: reason and destiny'
        })
    }
    next();

}