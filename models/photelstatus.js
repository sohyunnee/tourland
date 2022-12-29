const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('photelstatus', {
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'hotel',
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
    tableName: 'photelstatus',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "hotelId" },
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
