import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Fav CRM",
    description: "Api for  Fav CRM",
  },
  host: "favcrm.softwareexato.com",
  tags: [
    // by default: empty Array
    {
      name: "CRM api", 
      description: "App api", 
    },
  ],
};

const outputFile = "./swagger-output.json";
const routes = ["./index.js"];

swaggerAutogen()(outputFile, routes, doc);
