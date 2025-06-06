export default defineEventHandler(async () => {
  try {
    const storage = useStorage()
    const sequelize = storage.getItem('db:sequelize')
    
    return {
      hasSequelize: !!sequelize,
      sequelizeType: typeof sequelize,
      sequelizeKeys: sequelize ? Object.keys(sequelize) : [],
      hasAuthenticate: sequelize && typeof sequelize.authenticate === 'function'
    }
  } catch (error: any) {
    return {
      error: error.message,
      hasSequelize: false
    }
  }
})