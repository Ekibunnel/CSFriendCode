/// STEAM STUFF

// Copyright (c) 2020, Emily Hudson
// BSD 2-Clause License
// https://github.com/emily33901/js-csfriendcode

const ALNUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
//const RALNUM = {};
//for (let i = 0; i < ALNUM.length; i++) RALNUM[ALNUM[i]] = BigInt(i);
const RALNUM = {
    "A": 0n,
    "B": 1n,
    "C": 2n,
    "D": 3n,
    "E": 4n,
    "F": 5n,
    "G": 6n,
    "H": 7n,
    "J": 8n,
    "K": 9n,
    "L": 10n,
    "M": 11n,
    "N": 12n,
    "P": 13n,
    "Q": 14n,
    "R": 15n,
    "S": 16n,
    "T": 17n,
    "U": 18n,
    "V": 19n,
    "W": 20n,
    "X": 21n,
    "Y": 22n,
    "Z": 23n,
    "2": 24n,
    "3": 25n,
    "4": 26n,
    "5": 27n,
    "6": 28n,
    "7": 29n,
    "8": 30n,
    "9": 31n,
}
const DEFAULT_STEAM_ID = 0x110000100000000n;

function toLittleEndian(val) {
  const result = new Uint8Array(8);
  let i = 0;
  while (val > 0n) { result[i++] = Number(val % 256n); val /= 256n; }
  return result;
}

function fromLittleEndian(bytes) {
  let result = 0n, base = 1n;
  bytes.forEach(b => { result += base * BigInt(b); base *= 256n; });
  return result;
}

function fromBigEndian(bytes) {
  const rev = Uint8Array.from(bytes).reverse();
  return fromLittleEndian(rev);
}

function rb32(input) {
  let res = 0n, j = 0;
  for (let i = 0; i < 13; i++) {
    if (i === 4 || i === 9) j++;
    const ch = input[j++];
    const val = RALNUM[ch];
    if (val === undefined) {
      alert("Bad friend code!");
      throw new Error("bad char: " + ch);
    }
    res |= val << (5n * BigInt(i));
  }
  return fromBigEndian(toLittleEndian(res));
}

function decode(fc) {
  fc = fc.toUpperCase().trim();
  const stripped = fc.replace(/^AAAA-?/, "").replace(/-/g, "");
  const full = "AAAA-" + stripped.slice(0,5) + "-" + stripped.slice(5);
  let val = rb32(full), id = 0n;
  for (let i = 0; i < 8; i++) { val >>= 1n; const n = val & 0xFn; val >>= 4n; id = (id << 4n) | n; }
  return (id | DEFAULT_STEAM_ID).toString();
}

/// SITE STUFF

function SaveToLocalStorage(Name, ElementProperty, Overwrite) {
  if (Overwrite){
    localStorage.setItem(Name+"#"+ElementProperty, Overwrite);
  } else {
    localStorage.setItem(Name+"#"+ElementProperty, JSON.stringify(document.getElementById(Name)[ElementProperty]));
  }
}

function loadFromLocalStorage(Name, ElementProperty){
  let Itemvalue = localStorage.getItem(Name+"#"+ElementProperty);
  if (Itemvalue) return JSON.parse(Itemvalue);
  return Itemvalue;
}

function InitElementProperty(Element, Property, DefaultValue){
  let ElementStored = loadFromLocalStorage(Element, Property);
  if (ElementStored !== undefined && ElementStored !== null) {
    document.getElementById(Element)[Property] = ElementStored;
  } else {
    console.log(Element+"#"+Property+"is not set");
    document.getElementById(Element)[Property] = DefaultValue;
    SaveToLocalStorage(Element, Property, DefaultValue);
  }
}

function initialize(){
  InitElementProperty("GoOut", "checked", false);
  let paramsString = window.location.search;
  let searchParams = new URLSearchParams(paramsString);
  let codeFromParam = null;
  if (searchParams !== undefined && searchParams.size > 0) {
    for (var [key, value] of searchParams) {
      if (value === "" && key !== "") {
        codeFromParam = key;
        break;
      } else if(value !== "") {
        codeFromParam = value;
        break;
      }
    }
    SaveToLocalStorage("FriendCode", "value", JSON.stringify(codeFromParam))
  }
  InitElementProperty("FriendCode", "value", "");
  if (codeFromParam !== null) Convert();
}

function Convert(){
  document.getElementById("SteamID64").textContent = "";
  let friendcode = document.getElementById("FriendCode").value;
  if (!friendcode || !friendcode.trim().length) {
    alert("Empty input / no friend code found");
    return
  }
  let SteamID = decode(friendcode);
  if (document.getElementById("GoOut").checked == true) {
    window.location = "https://csst.at/profile/"+SteamID;
  }
  console.log("SteamID: "+SteamID);
  document.getElementById("FriendCode").value = ""
  document.getElementById("SteamID64").textContent = friendcode+" = "+SteamID;
}