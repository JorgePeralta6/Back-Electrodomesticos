export const validateReasonAndDestiny = (req, res, next) => {
    
    const { reason, destiny } = req.body;

    if (!reason || !destiny) {
        return res.status(400).json({
            success: false,
            msg: 'You must send reason and destiny'
        })
    }
    next();

}