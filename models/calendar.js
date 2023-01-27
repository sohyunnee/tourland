const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('calendar', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    memo: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    start: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    end: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    UserType: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    allDay: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'calendar',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
