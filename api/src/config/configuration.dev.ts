export const CONFIG = {
  port: 3000,
  cors: {
    origins: [
      "https://mf.localhost:4000",
      "http://localhost:4200",
      "http://localhost:4000"
    ]
  },
  database: {
    host: "localhost",
    port: 3306,
    username: "midific",
    password: "Mf!4rE9z",
    database: "midific",
    synchronize: true
  },
  stripe: {
    secret_key: "sk_test_51QABevDFA6Dx3FbuT2hpIjPgrG46AryfIMqp6UWrPMKGeUUcPgZocwAFqsLKku4IGFwzVsXHAHAc5Ec7RQa5YSpE00LuMC7E4G"
  },
  midi: {
    enc_key: "04a9eda468831a28150e46a6db7c54d39256e37b11ee44b6d98a764fdc817f79"
  },
  website: {
    url: "http://localhost:4000"
  }
}
export default () => CONFIG