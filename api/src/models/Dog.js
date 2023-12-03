const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Dog = sequelize.define(
    'dog',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      imagen: {
        type: DataTypes.JSONB,
        allowNull: true,
        get() {
          const image = this.getDataValue('imagen');
          return image ? JSON.parse(image) : null;
        },
        set(value) {
          this.setDataValue('imagen', JSON.stringify(value));
        },
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      altura: {
        type: DataTypes.JSONB,
        allowNull: true,
        get() {
          return JSON.parse(this.getDataValue('altura'));
        },
        set(value) {
          this.setDataValue('altura', JSON.stringify(value));
        },
      },
      peso: {
        type: DataTypes.JSONB,
        allowNull: true,
        get() {
          return JSON.parse(this.getDataValue('peso'));
        },
        set(value) {
          this.setDataValue('peso', JSON.stringify(value));
        },
      },
      anos_vida: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      origen: {
        type: DataTypes.ENUM('API', 'BD'),
        allowNull: false,
        defaultValue: 'BD',
      },
    },
    {
      timestamps: false,
    }
  );

  return Dog;
};
