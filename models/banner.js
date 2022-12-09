const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('banner', {
    id: {
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
    isSetting: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
      comment: "설정여부"
    },
    position: {
      type: DataTypes.CHAR(1),
      allowNull: true,
      comment: "배너위치"
    }
  }, {
    sequelize,
    tableName: 'banner',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
