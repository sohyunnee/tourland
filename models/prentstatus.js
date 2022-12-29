const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('prentstatus', {
    rentcarId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'rentcar',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'product',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'prentstatus',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "rentcarId" },
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
