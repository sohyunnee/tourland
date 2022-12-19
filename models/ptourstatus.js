const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes)=> {
  const ptourstatus = sequelize.define('ptourstatus', {
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
    tno: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "번호",
      references: {
        model: 'tour',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'ptourstatus',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
          { name: "tno" },
        ]
      },
      {
        name: "FK_tour_TO_ptourstatus",
        using: "BTREE",
        fields: [
          { name: "tno" },
        ]
      },
    ]
  });

  // ptourstatus.associate = models => {
  //   models.ptourstatus.belongsToMany(models.product, {through :'ptourstatus',
  //     foreignKey: 'id',sourceKey:'id'
  //   });
  //   models.ptourstatus.belongsToMany(models.tour, {through: 'ptourstatus',
  //     foreignKey: 'tno', sourceKey:'id'
  //   });
  // };

  return ptourstatus;
};
