import 'package:flutter/material.dart';
import 'package:flutter_application_2/services/data_service.dart';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:intl/date_symbol_data_local.dart';

// Diyetisyenin, danışanının yemeklerini gördüğü sayfa
class ClientMealDetailsPage extends StatefulWidget {
  final int clientUserId;
  final String clientName;

  const ClientMealDetailsPage({
    Key? key,
    required this.clientUserId,
    required this.clientName,
  }) : super(key: key);

  @override
  _ClientMealDetailsPageState createState() => _ClientMealDetailsPageState();
}

class _ClientMealDetailsPageState extends State<ClientMealDetailsPage> {
  final DataService _dataService = DataService();
  DateTime _selectedDay = DateTime.now();
  DateTime _focusedDay = DateTime.now();

  @override
  void initState() {
    super.initState();
    initializeDateFormatting('tr_TR', null);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        // Sayfa başlığında danışanın adını göster
        title: Text(widget.clientName), 
        backgroundColor: const Color.fromARGB(255, 125, 153, 92),
      ),
      body: Column(
        children: [
          // danisan.dart'tan kopyalanan Takvim
          TableCalendar(
            locale: 'tr_TR',
            firstDay: DateTime.utc(2020, 1, 1),
            lastDay: DateTime.utc(2030, 12, 31),
            focusedDay: _focusedDay,
            selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
            onDaySelected: (selectedDay, focusedDay) {
              setState(() {
                _selectedDay = selectedDay;
                _focusedDay = focusedDay;
              });
            },
            calendarFormat: CalendarFormat.week,
            headerStyle: const HeaderStyle(
              formatButtonVisible: false,
              titleCentered: true,
            ),
            calendarStyle: const CalendarStyle(
              todayDecoration: BoxDecoration(
                color: Color.fromARGB(255, 0, 0, 0),
                shape: BoxShape.circle,
              ),
              selectedDecoration: BoxDecoration(
                color: Color.fromARGB(255, 125, 153, 92),
                shape: BoxShape.circle,
              ),
            ),
          ),
          const SizedBox(height: 10),

          // danisan.dart'taki _buildMenuPage'den kopyalanan FutureBuilder
          Expanded(
            child: FutureBuilder<Map<String, dynamic>>(
              // API'yi danışanın ID'si (widget.clientUserId)
              // ve seçili gün (_selectedDay) ile çağır
              // Bu metot data_service.dart içinde zaten vardı (Adım 32)
              future: _dataService.getMealsForDay(widget.clientUserId, _selectedDay),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return Center(child: CircularProgressIndicator());
                }

                if (!snapshot.hasData || snapshot.data!['success'] == false) {
                  String errorMessage =
                      snapshot.data?['message'] ?? "Yemekler yüklenemedi.";
                  return Center(
                    child: Text(
                      'Hata: $errorMessage',
                      style: TextStyle(color: Colors.red, fontSize: 16),
                    ),
                  );
                }

                final List meals = snapshot.data!['data'];
                final String formattedDate =
                    DateFormat('dd MMMM yyyy', 'tr_TR').format(_selectedDay);

                if (meals.isEmpty) {
                  return Center(
                    child: Text(
                      '$formattedDate için kayıtlı yemek bulunmuyor.',
                      style: TextStyle(fontSize: 18, color: Colors.grey.shade600),
                      textAlign: TextAlign.center,
                    ),
                  );
                }

                // danisan.dart'tan kopyalanan gruplama mantığı
                Map<String, List> groupedMeals = {};
                for (var meal in meals) {
                  String mealType = meal['MealType'];
                  if (!groupedMeals.containsKey(mealType)) {
                    groupedMeals[mealType] = [];
                  }
                  groupedMeals[mealType]!.add(meal);
                }

                return ListView(
                  padding: const EdgeInsets.all(16.0),
                  children: groupedMeals.entries.map((entry) {
                    String mealType = entry.key;
                    List mealItems = entry.value;

                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      elevation: 2,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              mealType,
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Color.fromARGB(255, 125, 153, 92),
                              ),
                            ),
                            const Divider(height: 20),
                            ...mealItems.map((item) {
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 8.0),
                                child: Row(
                                  children: [
                                    Icon(Icons.restaurant_menu,
                                        size: 20, color: Colors.grey.shade600),
                                    const SizedBox(width: 12),
                                    Text(
                                      item['FoodName'],
                                      style: TextStyle(fontSize: 16),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}