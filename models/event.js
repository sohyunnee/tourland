const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('event', {
    no: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "번호"
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "제목"
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "내용"
    },
    pic: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "사진"
    },
    startdate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "시작날짜"
    },
    enddate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "종료일자"
    }
  }, {
    sequelize,
    tableName: 'event',
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
    ]
  });
};
