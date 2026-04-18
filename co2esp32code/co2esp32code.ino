#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include "SparkFun_SCD4x_Arduino_Library.h"

const char* ssid = "movil123";
const char* password = "del1al48";

WebServer server(80);
SCD4x mySensor;
int co2 = 0;

void handleData() {
  String json = "{\"co2\":" + String(co2) + "}";
  server.send(200, "application/json", json);
}

void setup() {
  Serial.begin(115200);
  Wire.begin();

  mySensor.begin();
  mySensor.startPeriodicMeasurement();

  WiFi.begin(ssid, password);

  Serial.print("Conectando...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConectado!");
  Serial.print("IP del ESP32: ");
  Serial.println(WiFi.localIP());

  server.on("/data", handleData);
  server.begin();
}

void loop() {
  server.handleClient();

  if (mySensor.readMeasurement()) {
    co2 = mySensor.getCO2();
  }
}