{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell rec {
  buildInputs = [
    pkgs.nodejs
    pkgs.nodejs.pkgs.yarn
  ];
}
