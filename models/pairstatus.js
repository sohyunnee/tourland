const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const pairstatus =  sequelize.define('pairstatus', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "번호"
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
          { name: "id" },
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
    models.pairstatus.belongsToMany(models.product, {through :'pairstatus',
      foreignKey: 'id'
    });
    // models.pairstatus.belongsToMany(models.airplane, {through: 'pairstatus',
    //   foreignKey: 'id'
    // });
  };

  return pairstatus
};
