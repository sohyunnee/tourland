const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const photelstatus = sequelize.define('photelstatus', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "상품번호",
      references: {
        model: 'product',
        key: 'id'
      }
    },
    hno: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "호텔번호",
      references: {
        model: 'hotel',
        key: 'no'
      }
    }
  }, {
    sequelize,
    tableName: 'photelstatus',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
          { name: "hno" },
        ]
      },
      {
        name: "FK_hotel_TO_photelstatus",
        using: "BTREE",
        fields: [
          { name: "hno" },
        ]
      },
    ]
  });

  // photelstatus.associate = models => {
  //   models.product.belongsToMany(models.hotel, {through:photelstatus,
  //     foreignKey: 'id'
  //   });
  //   models.hotel.belongsToMany(models.product, {through:photelstatus,
  //     foreignKey: 'hno'
  //   });
  // }

  return photelstatus;
};
