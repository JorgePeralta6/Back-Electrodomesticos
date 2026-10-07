export const validateDates = (req, res, next) => {
    
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({
            success: false,
            msg: 'You did not provide dates in the query',
        })
    }
    next();

}