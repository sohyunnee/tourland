const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reservation', {
    no: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "예약번호"
    },
    userno: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "유저번호",
      references: {
        model: 'user',
        key: 'userno'
      }
    },
    rdate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "예약날짜"
    },
    rstatus: {
      type: DataTypes.CHAR(1),
      allowNull: true,
      comment: "예약상태"
    }
  }, {
    sequelize,
    tableName: 'reservation',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "no" },
        ]
      },
      {
        name: "FK_user_TO_reservation",
        using: "BTREE",
        fields: [
          { name: "userno" },
        ]
      },
    ]
  });
};
