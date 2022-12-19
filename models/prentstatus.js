const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const prentstatus= sequelize.define('prentstatus', {
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
    rno: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "렌트카번호",
      references: {
        model: 'rentcar',
        key: 'no'
      }
    }
  }, {
    sequelize,
    tableName: 'prentstatus',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
          { name: "rno" },
        ]
      },
      {
        name: "FK_rentcar_TO_prentstatus",
        using: "BTREE",
        fields: [
          { name: "rno" },
        ]
      },
    ]
  });
  // prentstatus.associate = models => {
  //   models.prentstatus.belongsTo(models.product, {through :'prentstatus',
  //     foreignKey: 'id'
  //   });
  //   models.prentstatus.belongsTo(models.rentcar, {through: 'prentstatus',
  //     foreignKey: 'rno'
  //   });
  // };

  return prentstatus;
};
