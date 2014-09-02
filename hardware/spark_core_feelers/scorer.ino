int feeler1 = D0;
int feeler2 = D2;
int batteryLowIndicator = D4;
int pingFrequency = 5000;
unsigned long lastPing = millis();
bool batteryLow = false;
bool sentOnlineMessage = false;

int feeler1PreviousState;
int feeler2PreviousState;
int batteryLevelPreviousState;

void setup() {
    pinMode(feeler1, INPUT_PULLDOWN);
    pinMode(feeler2, INPUT_PULLDOWN);
    pinMode(batteryLowIndicator, INPUT_PULLUP);
}

void loop() {
    
    int feeler1Pressed = digitalRead(feeler1);
    int feeler2Pressed = digitalRead(feeler2);
    int batteryLevel = digitalRead(batteryLowIndicator);
    
    if (Spark.connected() && !sentOnlineMessage) {
        sentOnlineMessage = true;
        Spark.publish("online", "1", 60, PRIVATE);
    }
    
    if(feeler1Pressed == HIGH && feeler1Pressed != feeler1PreviousState) {
        Spark.publish("scored", "1", 60, PRIVATE);
    }
    
    if(feeler2Pressed == HIGH && feeler2Pressed != feeler2PreviousState) {
        Spark.publish("scored", "2", 60, PRIVATE);
    }
    
    if(batteryLevel == LOW && batteryLevel != batteryLevelPreviousState) {
        Spark.publish("batteryLow", "1", 60, PRIVATE);
    }
    
    // Ping server every x seconds
    if (millis() - lastPing > pingFrequency) {
        Spark.publish("ping", "1", 60, PRIVATE);
        lastPing = millis();
    }
    
    feeler1PreviousState = feeler1Pressed;
    feeler2PreviousState = feeler2Pressed;
    batteryLevelPreviousState = batteryLevel;
    
    delay(100);
}
