class APIFeatures {
  constructor(query, queryString) {
    this.query = query;             // mongoose query
    this.queryString = queryString; // req.query
  }

  // 🔍 GLOBAL SEARCH (OR condition)
  search(fields = []) {
    if (this.queryString.search && fields.length > 0) {
      const keyword = this.queryString.search;

      const searchQuery = {
        $or: fields.map(field => ({
          [field]: { $regex: keyword, $options: "i" }
        }))
      };

      this.query = this.query.find(searchQuery);
    }

    return this;
  }

  // 🎯 FILTER (dynamic + operators)
  filter() {
    const queryObj = { ...this.queryString };

    // ❌ remove unwanted fields
    const excludedFields = ["startDate", "endDate", "search", "page", "limit", "sort", "fields"];
    excludedFields.forEach(el => delete queryObj[el]);

    const mongoQuery = {};

    for (let key in queryObj) {

      // 🔥 handle operators (price[gte]=100)
      if (key.includes("[")) {
        const field = key.split("[")[0];
        const operator = key.match(/\[(.*)\]/)[1];

        if (!mongoQuery[field]) {
          mongoQuery[field] = {};
        }

        mongoQuery[field][`$${operator}`] = Number(queryObj[key]);
      } 
      
      else {
        const value = queryObj[key];

        // 🔥 convert string → regex (case-insensitive search)
        if (typeof value === "string") {
          mongoQuery[key] = { $regex: value, $options: "i" };
        } else {
          mongoQuery[key] = value;
        }
      }
    }

    this.query = this.query.find(mongoQuery);

    return this;
  }

  // 📄 PAGINATION
  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  // ↕️ SORTING
  sort() {
    if (this.queryString.sort) {
      // example: sort=price,-createdAt
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt"); // default latest
    }

    return this;
  }

  // 🎯 FIELD LIMITING
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }
}

export default APIFeatures;