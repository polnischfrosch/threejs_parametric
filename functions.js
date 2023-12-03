function remapNumber(value, fromLow, fromHigh, toLow, toHigh) {
    var ratio = (value - fromLow) / (fromHigh - fromLow);
    return toLow + ratio * (toHigh - toLow);
  }