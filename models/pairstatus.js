const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pairstatus', {
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'product',
        key: 'id'
      }
    },
    airplaneId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'airplane',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'pairstatus',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "airplaneId" },
          { name: "productId" },
        ]
      },
      {
        name: "productId",
        using: "BTREE",
        fields: [
          { name: "productId" },
        ]
      },
    ]
  });
};
