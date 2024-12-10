exports.success_function = function (api_data) {
    return {
        success: true,
        statusCode: api_data.statusCode,
        data: api_data.data ?? null,
        message: api_data.message ?? null
    };
};

exports.error_function = function (api_data) {
    return {
        success: false,
        statusCode: api_data.statusCode,
        data: api_data.data ?? null,
        message: api_data.message ?? null
    };
};
