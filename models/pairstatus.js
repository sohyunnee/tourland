const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pairstatus', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "번호"
    },
    pno: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "상품번호",
      references: {
        model: 'product',
        key: 'pno'
      }
    },
    ano: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "항공번호",
      references: {
        model: 'airplane',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'pairstatus',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "pno" },
          { name: "ano" },
        ]
      },
      {
        name: "FK_airplane_TO_pairstatus2",
        using: "BTREE",
        fields: [
          { name: "ano" },
        ]
      },
    ]
  });

  pairstatus.associate = models => {
    models.pairstatus.belongsTo(models.product, {
      foreignKey: 'pno', sourceKey: "pno"
    });
    models.pairstatus.belongsTo(models.airplane, {
      foreignKey: 'id', sourceKey: "pno"
    });
  };
};
