import { DataTypes, Model } from 'sequelize'
import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  BelongsToManyAddAssociationMixin,
  HasManyGetAssociationsMixin,
  Sequelize,
} from 'sequelize'

// Model classes
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: string
  declare email: string
  declare name: string
  declare picture: string | null
  declare role: CreationOptional<string | null>
  declare isAdmin: CreationOptional<boolean>
  declare readonly createdAt: CreationOptional<Date>
  declare readonly updatedAt: CreationOptional<Date>

  // Association methods
  declare addTeam: BelongsToManyAddAssociationMixin<Team, Team['id']>
  declare teams?: Team[]
  declare getTeams: HasManyGetAssociationsMixin<Team>
}

export class Team extends Model<InferAttributes<Team>, InferCreationAttributes<Team>> {
  declare id: CreationOptional<string>
  declare name: string
  declare captainId: ForeignKey<User['id']>
  declare readonly createdAt: CreationOptional<Date>
  declare readonly updatedAt: CreationOptional<Date>

  // Association methods
  declare addUser: BelongsToManyAddAssociationMixin<User, User['id']>
  declare members?: User[]
  declare getMembers: HasManyGetAssociationsMixin<User>
}

export class Task extends Model<InferAttributes<Task>, InferCreationAttributes<Task>> {
  declare id: CreationOptional<string>
  declare title: string
  declare category: string
  declare description: string
  declare estimatedTime: number
  declare difficulty: CreationOptional<number>
  declare readonly createdAt: CreationOptional<Date>
  declare readonly updatedAt: CreationOptional<Date>
}

export class Submission extends Model<
  InferAttributes<Submission>,
  InferCreationAttributes<Submission>
> {
  declare id: CreationOptional<string>
  declare teamId: ForeignKey<Team['id']>
  declare taskId: ForeignKey<Task['id']>
  declare status: CreationOptional<'in_progress' | 'completed'>
  declare chatHistory: CreationOptional<unknown[]>
  declare finalAnswers: CreationOptional<unknown[]>
  declare submittedAt: CreationOptional<Date | null>
  declare readonly createdAt: CreationOptional<Date>
  declare readonly updatedAt: CreationOptional<Date>
}

export function initModels(sequelize: Sequelize) {
  // Initialize User model
  User.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      picture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'User',
    }
  )

  // Initialize Team model
  Team.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      captainId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Team',
    }
  )

  // Initialize Task model
  Task.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      estimatedTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      difficulty: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: {
          min: 1,
          max: 3,
        },
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Task',
    }
  )

  // Initialize Submission model
  Submission.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      teamId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      taskId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('in_progress', 'completed'),
        defaultValue: 'in_progress',
      },
      chatHistory: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      finalAnswers: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      submittedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Submission',
    }
  )

  // Define associations
  Team.belongsToMany(User, { through: 'TeamMembers', as: 'members' })
  User.belongsToMany(Team, { through: 'TeamMembers', as: 'teams' })

  Team.belongsTo(User, { as: 'captain', foreignKey: 'captainId' })
  Team.hasMany(Submission, { foreignKey: 'teamId', as: 'submissions' })

  Task.hasMany(Submission, { foreignKey: 'taskId', as: 'submissions' })

  Submission.belongsTo(Team, { foreignKey: 'teamId', as: 'team' })
  Submission.belongsTo(Task, { foreignKey: 'taskId', as: 'task' })

  return { User, Team, Task, Submission }
}
