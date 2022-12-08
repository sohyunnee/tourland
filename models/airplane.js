const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('airplane', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "번호"
    },
    ano: {
      type: DataTypes.CHAR(5),
      allowNull: true,
      comment: "항공기번호"
    },
    dlocation: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "출발지역"
    },
    rlocation: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "도착지역"
    },
    ddate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "출발시간"
    },
    rdate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "도착시간"
    },
    ldiv: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "장소구분"
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "인원"
    },
    seat: {
      type: DataTypes.CHAR(1),
      allowNull: true,
      comment: "좌석"
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "가격"
    },
    pdiv: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "상품구분"
    }
  }, {
    sequelize,
    tableName: 'airplane',
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
