const webpack = require("webpack");
require("dotenv").config(); // Ako koristiš .env fajl

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NG_APP_BASE_URL: JSON.stringify(
          process.env.NG_APP_BASE_URL || "http://localhost:8080/api"
        ),
      },
    }),
  ],
};
