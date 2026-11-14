"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMaterial = exports.getMaterialsByCourse = exports.uploadMaterial = void 0;
const Material_1 = require("../models/Material");
const Course_1 = require("../models/Course");
const responseHandler_1 = require("../utils/responseHandler");
// Stored values are legacy local paths (sometimes with Windows backslashes);
// serve every file from the public /uploads route by filename only.
const toFileUrl = (storedPath) => `/uploads/${storedPath.split(/[\\/]/).pop()}`;
const uploadMaterial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { courseId } = req.params;
        const file = req.file;
        if (!file) {
            (0, responseHandler_1.sendResponse)(res, 400, false, "No file uploaded", null);
            return;
        }
        const material = new Material_1.Material({
            title: req.body.title,
            fileUrl: `/uploads/${file.filename}`,
            courseId,
            uploadedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
        });
        yield material.save();
        // Update the course to include the new material
        yield Course_1.Course.findByIdAndUpdate(courseId, {
            $addToSet: { materials: material._id },
        });
        (0, responseHandler_1.sendResponse)(res, 201, true, "Material uploaded successfully", material);
    }
    catch (error) {
        (0, responseHandler_1.sendResponse)(res, 500, false, "Failed to upload material", null);
    }
});
exports.uploadMaterial = uploadMaterial;
const getMaterialsByCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        const materials = yield Material_1.Material.find({ courseId });
        const data = materials.map((material) => (Object.assign(Object.assign({}, material.toObject()), { fileUrl: toFileUrl(material.fileUrl) })));
        (0, responseHandler_1.sendResponse)(res, 200, true, "Materials fetched successfully", data);
    }
    catch (error) {
        (0, responseHandler_1.sendResponse)(res, 500, false, "Failed to fetch materials", null);
    }
});
exports.getMaterialsByCourse = getMaterialsByCourse;
const deleteMaterial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const materialId = req.params.id;
        // Find and delete the material
        const material = yield Material_1.Material.findByIdAndDelete(materialId);
        if (!material) {
            (0, responseHandler_1.sendResponse)(res, 404, false, "Material not found", null);
            return;
        }
        // Update the course to remove the deleted material
        yield Course_1.Course.findByIdAndUpdate(material.courseId, {
            $pull: { materials: materialId },
        });
        (0, responseHandler_1.sendResponse)(res, 200, true, "Material deleted successfully", null);
        return;
    }
    catch (error) {
        console.error("Error deleting material:", error);
        (0, responseHandler_1.sendResponse)(res, 500, false, "Failed to delete material", null);
        return;
    }
});
exports.deleteMaterial = deleteMaterial;
//# sourceMappingURL=material.controller.js.map
