"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = exports.ApiError = void 0;
class ApiError {
    constructor(code, message) {
        this.code = code;
        this.message = message;
    }
}
exports.ApiError = ApiError;
class Result {
    constructor(data, errors, isSuccess, warnings = null, info = null) {
        this.data = data;
        this.errors = errors;
        this.isSuccess = isSuccess;
        this.warnings = warnings;
        this.info = info;
    }
    static success(data) {
        return new Result(data, null, true);
    }
    static failure(errors) {
        return new Result(null, errors, false);
    }
}
exports.Result = Result;
