interface  userValues {
    amount?: string,
    skip?: string
}
const getTakeAndSkip = function getTakeAndSkipFromQueryOrReturnDefaultValues(values: userValues) {
    return {
        take: values.amount !== undefined && Math.floor(Number(values.amount)) || 30,
        skip: values.skip !== undefined && Math.floor(Number(values.skip)) || 0,
    };
};

export {
    getTakeAndSkip,
};