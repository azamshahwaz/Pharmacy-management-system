class APIAggregation {
  constructor(queryParams) {
    this.queryParams = queryParams;
  }

  // 🔹 1. BASE MATCH (pre-filter)
  match(extraMatch = {}) {
    let matchStage = { ...extraMatch };

    if (this.queryParams.status) {
      matchStage.status = this.queryParams.status;
    }

    if (this.queryParams.startDate || this.queryParams.endDate) {
      matchStage.createdAt = {};
      if (this.queryParams.startDate) {
        matchStage.createdAt.$gte = new Date(this.queryParams.startDate);
      }
      if (this.queryParams.endDate) {
        matchStage.createdAt.$lte = new Date(this.queryParams.endDate);
      }
    }

    return Object.keys(matchStage).length ? { $match: matchStage } : null;
  }

  // 🔍 2. GLOBAL SEARCH (embedded fields safe)
  search(fields = []) {
    let search = this.queryParams.search;

    if (!search || fields.length === 0) return null;

    search = search.trim();
    if (!search) return null;

    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    return {
      $match: {
        $or: fields.map(field => ({
          [field]: { $regex: escaped, $options: "i" }
        }))
      }
    };
  }

  fieldSearch(fieldMap = {}) {
  let matchStage = {};

  Object.keys(fieldMap).forEach(param => {
    if (this.queryParams[param]) {
      matchStage[fieldMap[param]] = {
        $regex: this.queryParams[param].trim(),
        $options: "i"
      };
    }
  });

  return Object.keys(matchStage).length ? { $match: matchStage } : null;
}

  // 🔹 3. POST FILTER (after search)
  postMatch() {
    let matchStage = {};

    // 💊 medicine name filter
    if (this.queryParams.productName) {
      matchStage["items.medicineName"] = {
        $regex: this.queryParams.productName.trim(),
        $options: "i"
      };
    }

    // 💰 price filter
    if (this.queryParams.minPrice || this.queryParams.maxPrice) {
      matchStage.grandTotal = {};

      if (this.queryParams.minPrice) {
        matchStage.grandTotal.$gte = Number(this.queryParams.minPrice);
      }

      if (this.queryParams.maxPrice) {
        matchStage.grandTotal.$lte = Number(this.queryParams.maxPrice);
      }
    }

    return Object.keys(matchStage).length ? { $match: matchStage } : null;
  }

  // 🔹 4. SORT
  sort(defaultSort = { createdAt: -1 }) {
    if (!this.queryParams.sort) return { $sort: defaultSort };

    const sortFields = this.queryParams.sort.split(",");
    let sortObj = {};

    sortFields.forEach(field => {
      if (field.startsWith("-")) {
        sortObj[field.substring(1)] = -1;
      } else {
        sortObj[field] = 1;
      }
    });

    return { $sort: sortObj };
  }

  // 🔹 5. PAGINATION
  paginate() {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 10;
    const skip = (page - 1) * limit;

    return {
      page,
      limit,
      skip,
      stages: [
        { $skip: skip },
        { $limit: limit }
      ]
    };
  }

  // 🔹 6. REMOVE FIELDS (NEW 🔥)
  project(excludeFields = ["createdAt", "updatedAt", "__v"]) {
    let projectObj = {};

    excludeFields.forEach(field => {
      projectObj[field] = 0;
    });

    return { $project: projectObj };
  }

  // 🔹 7. SAFE PUSH
  static pushStage(pipeline, stage) {
    if (stage) pipeline.push(stage);
  }
}

export default APIAggregation;