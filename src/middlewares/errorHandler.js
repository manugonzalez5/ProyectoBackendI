const errorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(500).send({ error: err.message });
    next();
}

export default errorHandler;